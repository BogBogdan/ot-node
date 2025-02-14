import { OPERATION_ID_STATUS, OPERATION_STATUS, ERROR_TYPE } from '../../../constants/constants.js';
import BaseController from '../base-http-api-controller.js';

class AskController extends BaseController {
    constructor(ctx) {
        super(ctx);
        this.commandExecutor = ctx.commandExecutor;
        this.operationIdService = ctx.operationIdService;
        this.operationService = ctx.askService;
        this.repositoryModuleManager = ctx.repositoryModuleManager;
        this.ualService = ctx.ualService;
        this.validationService = ctx.validationService;
        this.blockchainModuleManager = ctx.blockchainModuleManager;
    }

    async handleRequest(req, res) {
        const operationId = await this.operationIdService.generateOperationId(
            OPERATION_ID_STATUS.ASK.ASK_START,
        );

        await this.operationIdService.updateOperationIdStatus(
            operationId,
            null,
            OPERATION_ID_STATUS.ASK.ASK_START,
        );

        this.returnResponse(res, 202, {
            operationId,
        });

        await this.repositoryModuleManager.createOperationRecord(
            this.operationService.getOperationName(),
            operationId,
            OPERATION_STATUS.IN_PROGRESS,
        );

        const { ual, blockchain, minimumNumberOfNodeReplications } = req.body;

        try {
            this.logger.info(`Ask for ${ual} with operation id ${operationId} initiated.`);

            const commandSequence = ['askFindShardCommand', 'networkAskCommand'];

            const { contract, knowledgeCollectionId } = this.ualService.resolveUAL(ual);

            const datasetRoot =
                await this.blockchainModuleManager.getKnowledgeCollectionLatestMerkleRoot(
                    blockchain,
                    contract,
                    knowledgeCollectionId,
                );

            await this.commandExecutor.add({
                name: commandSequence[0],
                sequence: commandSequence.slice(1),
                delay: 0,
                data: {
                    ual,
                    operationId,
                    blockchain,
                    datasetRoot,
                    minimumNumberOfNodeReplications,
                },
                transactional: false,
            });

            await this.operationIdService.updateOperationIdStatus(
                operationId,
                blockchain,
                OPERATION_ID_STATUS.ASK.ASK_END,
            );
        } catch (error) {
            this.logger.error(`Error while initializing ask: ${error.message}.`);

            await this.operationService.markOperationAsFailed(
                operationId,
                blockchain,
                'Unable to check ask, Failed to process input data!',
                ERROR_TYPE.ASK.ASK_ERROR,
            );
        }
    }
}

export default AskController;
