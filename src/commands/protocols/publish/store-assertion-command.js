import Command from '../../command.js';
import {
    OPERATION_ID_STATUS,
    ERROR_TYPE,
    TRIPLE_STORE_REPOSITORIES,
} from '../../../constants/constants.js';

class StoreAssertionCommand extends Command {
    constructor(ctx) {
        super(ctx);
        this.operationIdService = ctx.operationIdService;
        this.ualService = ctx.ualService;
        this.dataService = ctx.dataService;
        this.tripleStoreService = ctx.tripleStoreService;
        this.networkModuleManager = ctx.networkModuleManager;
        this.repositoryModuleManager = ctx.repositoryModuleManager;

        this.errorType = ERROR_TYPE.STORE_ASSERTION_ERROR;
    }

    async execute(command) {
        const {
            operationId,
            ual,
            blockchain,
            assertion,
            publishOperationId,
            remotePeerId: publisherPeerId,
        } = command.data;

        await this.operationIdService.updateOperationIdStatus(
            operationId,
            blockchain,
            OPERATION_ID_STATUS.PUBLISH_FINALIZATION.PUBLISH_FINALIZATION_STORE_ASSERTION_START,
        );
        try {
            await this._insertAssertion(assertion, ual);

            await this.operationIdService.updateOperationIdStatus(
                operationId,
                blockchain,
                OPERATION_ID_STATUS.PUBLISH_FINALIZATION.PUBLISH_FINALIZATION_STORE_ASSERTION_END,
            );

            const myPeerId = this.networkModuleManager.getPeerId().toB58String();
            if (publisherPeerId === myPeerId) {
                await this.repositoryModuleManager.saveFinalityAck(
                    publishOperationId,
                    ual,
                    publisherPeerId,
                );
            } else {
                command.sequence.push('findPublisherNodeCommand', 'networkFinalityCommand');
            }
        } catch (e) {
            await this.handleError(operationId, blockchain, e.message, this.errorType, true);
            return Command.empty(); // TODO: Should it end here or do a retry?
        }

        return this.continueSequence(command.data, command.sequence);
    }

    async _insertAssertion(assertion, ual) {
        await this.tripleStoreService.insertKnowledgeCollection(
            TRIPLE_STORE_REPOSITORIES.DKG,
            ual,
            assertion,
        );
    }

    /**
     * Builds default storeAssertionCommand
     * @param map
     * @returns {{add, data: *, delay: *, deadline: *}}
     */
    default(map) {
        const command = {
            name: 'storeAssertionCommand',
            delay: 0,
            retries: 0,
            transactional: false,
        };
        Object.assign(command, map);
        return command;
    }
}

export default StoreAssertionCommand;
