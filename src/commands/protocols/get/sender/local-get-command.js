import Command from '../../../command.js';
import { OPERATION_ID_STATUS, ERROR_TYPE } from '../../../../constants/constants.js';

class LocalGetCommand extends Command {
    constructor(ctx) {
        super(ctx);
        this.blockchainModuleManager = ctx.blockchainModuleManager;
        this.config = ctx.config;
        this.operationService = ctx.getService;
        this.operationIdService = ctx.operationIdService;
        this.tripleStoreService = ctx.tripleStoreService;
        this.pendingStorageService = ctx.pendingStorageService;
        this.paranetService = ctx.paranetService;
        this.ualService = ctx.ualService;
        this.repositoryModuleManager = ctx.repositoryModuleManager;

        this.errorType = ERROR_TYPE.GET.GET_LOCAL_ERROR;
    }

    /**
     * Executes command and produces one or more events
     * @param command
     */
    async execute(command) {
        const { operationId, blockchain, ual, includeMetadata } = command.data;
        await this.operationIdService.updateOperationIdStatus(
            operationId,
            blockchain,
            OPERATION_ID_STATUS.GET.GET_LOCAL_START,
        );

        // const response = {};

        // if (paranetUAL) {
        //     const paranetRepository = this.paranetService.getParanetRepositoryName(paranetUAL);

        //     const ual = this.ualService.deriveUAL(blockchain, contract, tokenId);
        //     const syncedAssetRecord =
        //         await this.repositoryModuleManager.getParanetSyncedAssetRecordByUAL(ual);

        //     const nquads = await this.tripleStoreService.getAssertion(
        //         paranetRepository,
        //         syncedAssetRecord.publicAssertionId,
        //     );

        //     let privateNquads;
        //     if (syncedAssetRecord.privateAssertionId) {
        //         privateNquads = await this.tripleStoreService.getAssertion(
        //             paranetRepository,
        //             syncedAssetRecord.privateAssertionId,
        //         );
        //     }

        //     if (nquads?.length) {
        //         response.assertion = nquads;
        //         if (privateNquads?.length) {
        //             response.privateAssertion = privateNquads;
        //         }
        //     } else {
        //         this.handleError(
        //             operationId,
        //             blockchain,
        //             `Couldn't find locally asset with ${ual} in paranet ${paranetUAL}`,
        //             this.errorType,
        //         );
        //     }

        //     await this.operationService.markOperationAsCompleted(
        //         operationId,
        //         blockchain,
        //         response,
        //         [
        //             OPERATION_ID_STATUS.GET.GET_LOCAL_END,
        //             OPERATION_ID_STATUS.GET.GET_END,
        //             OPERATION_ID_STATUS.COMPLETED,
        //         ],
        //     );

        //     return Command.empty();
        // }

        // else {
        this.operationIdService.emitChangeEvent(
            OPERATION_ID_STATUS.GET.GET_LOCAL_GET_ASSERTION_START,
            operationId,
            blockchain,
        );
        const assertion = await this.tripleStoreService.getAssertion(ual);
        // const promises = [this.tripleStoreService.getAssertion(ual)];
        this.operationIdService.emitChangeEvent(
            OPERATION_ID_STATUS.GET.GET_LOCAL_GET_ASSERTION_END,
            operationId,
            blockchain,
        );

        this.operationIdService.emitChangeEvent(
            OPERATION_ID_STATUS.GET.GET_LOCAL_GET_KA_METADATA_START,
            operationId,
            blockchain,
        );
        const knowledgeAssetMetadata = includeMetadata
            ? await this.tripleStoreService.getKnowledgeAssetMetadata(ual)
            : undefined;
        this.operationIdService.emitChangeEvent(
            OPERATION_ID_STATUS.GET.GET_LOCAL_GET_KA_METADATA_END,
            operationId,
            blockchain,
        );
        // if (includeMetadata) {
        //     promises.push(this.tripleStoreService.getKnowledgeAssetMetadata(ual));
        // }

        // const [assertion, knowledgeAssetMetadata] = await Promise.all(promises);

        const responseData = {
            assertion,
            ...(includeMetadata && knowledgeAssetMetadata && { metadata: knowledgeAssetMetadata }),
        };
        if (assertion.length) {
            await this.operationService.markOperationAsCompleted(
                operationId,
                blockchain,
                responseData,
                [
                    OPERATION_ID_STATUS.GET.GET_LOCAL_END,
                    OPERATION_ID_STATUS.GET.GET_END,
                    OPERATION_ID_STATUS.COMPLETED,
                ],
            );

            return Command.empty();
        }
        // }

        await this.operationIdService.updateOperationIdStatus(
            operationId,
            blockchain,
            OPERATION_ID_STATUS.GET.GET_LOCAL_END,
        );

        return this.continueSequence(command.data, command.sequence);
    }

    async handleError(operationId, blockchain, errorMessage, errorType) {
        await this.operationService.markOperationAsFailed(
            operationId,
            blockchain,
            errorMessage,
            errorType,
        );
    }

    /**
     * Builds default localGetCommand
     * @param map
     * @returns {{add, data: *, delay: *, deadline: *}}
     */
    default(map) {
        const command = {
            name: 'localGetCommand',
            delay: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

export default LocalGetCommand;
