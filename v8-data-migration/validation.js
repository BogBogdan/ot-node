import logger from './logger.js';

export function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        logger.error(
            `[VALIDATION ERROR] Config is not defined or it is not an object. Config: ${config}`,
        );
        process.exit(1);
    }
}

export function validateBlockchainName(blockchainName) {
    if (!blockchainName || typeof blockchainName !== 'string') {
        throw new Error(
            `[VALIDATION ERROR] Blockchain name is defined or it is not a string. Blockchain name: ${blockchainName}`,
        );
    }
}

export function validateBlockchainDetails(blockchainDetails) {
    if (
        !blockchainDetails ||
        typeof blockchainDetails !== 'object' ||
        !Object.keys(blockchainDetails).includes('ID') ||
        !Object.keys(blockchainDetails).includes('ENV') ||
        !Object.keys(blockchainDetails).includes('NAME') ||
        !Object.keys(blockchainDetails).includes('CONTENT_ASSET_STORAGE_CONTRACT_ADDRESS')
    ) {
        throw new Error(
            `[VALIDATION ERROR] Blockchain details is defined or it is not an object. Blockchain details: ${blockchainDetails}`,
        );
    }
}

export function validateTokenId(tokenId) {
    if (typeof tokenId !== 'string' && typeof tokenId !== 'number') {
        throw new Error(
            `[VALIDATION ERROR] Token ID is not a string or number. Token ID: ${tokenId}. Type: ${typeof tokenId}`,
        );
    }
}

export function validateUal(ual) {
    if (!ual.startsWith('did:dkg:') || typeof ual !== 'string') {
        throw new Error(`[VALIDATION ERROR] UAL is not a valid UAL. UAL: ${ual}`);
    }
}

export function validateTripleStoreRepositories(tripleStoreRepositories) {
    if (!tripleStoreRepositories || typeof tripleStoreRepositories !== 'object') {
        logger.error(
            `[VALIDATION ERROR] Triple store repositories is not defined or it is not an object. Triple store repositories: ${tripleStoreRepositories}`,
        );
        process.exit(1);
    }
}

export function validateTripleStoreImplementation(tripleStoreImplementation) {
    if (!tripleStoreImplementation || typeof tripleStoreImplementation !== 'string') {
        logger.error(
            `[VALIDATION ERROR] Triple store implementation is not defined or it is not a string. Triple store implementation: ${tripleStoreImplementation}`,
        );
        process.exit(1);
    }
}

export function validateTripleStoreConfig(tripleStoreConfig) {
    if (!tripleStoreConfig || typeof tripleStoreConfig !== 'object') {
        logger.error(
            `[VALIDATION ERROR] Triple store config is not defined or it is not an object. Triple store config: ${tripleStoreConfig}`,
        );
        process.exit(1);
    }
}

export function validateRepository(repository) {
    if (!repository || typeof repository !== 'string') {
        logger.error(
            `[VALIDATION ERROR] Repository is not defined or it is not a string. Repository: ${repository}`,
        );
        process.exit(1);
    }
}

export function validateQuery(query) {
    if (!query || typeof query !== 'string') {
        throw new Error(
            `[VALIDATION ERROR] Query is not defined or it is not a string. Query: ${query}`,
        );
    }
}

export function validateAssertionId(assertionId) {
    if (!assertionId || typeof assertionId !== 'string') {
        throw new Error(
            `[VALIDATION ERROR] Assertion ID is not defined or it is not a string. Assertion ID: ${assertionId}`,
        );
    }
}

export function validateAssertion(assertion) {
    if (!assertion || typeof assertion !== 'string') {
        throw new Error(
            `[VALIDATION ERROR] Assertion is not defined or it is not a string. Assertion: ${assertion}`,
        );
    }
}

// BLOCKCHAIN
export function validateProvider(provider) {
    if (!provider || typeof provider !== 'object') {
        throw new Error(
            `[VALIDATION ERROR] Provider is not defined or it is not an object. Provider: ${provider}`,
        );
    }
}

export function validateStorageContractAddress(storageContractAddress) {
    if (!storageContractAddress || typeof storageContractAddress !== 'string') {
        throw new Error(
            `[VALIDATION ERROR] Storage contract address is not defined or it is not a string. Storage contract address: ${storageContractAddress}`,
        );
    }
}

export function validateStorageContractName(storageContractName) {
    if (!storageContractName || typeof storageContractName !== 'string') {
        throw new Error(
            `[VALIDATION ERROR] Storage contract name is not defined or it is not a string. Storage contract name: ${storageContractName}`,
        );
    }
}

export function validateStorageContractAbi(storageContractAbi) {
    if (!storageContractAbi || typeof storageContractAbi !== 'object') {
        throw new Error(
            `[VALIDATION ERROR] Storage contract ABI is not defined or it is not an object. Storage contract ABI: ${storageContractAbi}`,
        );
    }
}

export function validateBatchData(batchData) {
    if (!batchData || typeof batchData !== 'object') {
        throw new Error(
            `[VALIDATION ERROR] Batch data is not defined or it is not an object. Batch data: ${batchData}`,
        );
    }
}
