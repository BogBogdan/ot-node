import { kcTools } from 'assertion-tools';
import {
    XML_DATA_TYPES,
    PRIVATE_HASH_SUBJECT_PREFIX,
    V0_PRIVATE_ASSERTION_PREDICATE,
    CHUNK_BYTE_SIZE,
} from '../constants/constants.js';

class DataService {
    constructor(ctx) {
        this.config = ctx.config;
        this.logger = ctx.logger;

        this.cryptoService = ctx.cryptoService;
    }

    calculateAssertionSize(assertion) {
        const numberOfChunks = kcTools.calculateNumberOfChunks(assertion, CHUNK_BYTE_SIZE);
        return numberOfChunks * CHUNK_BYTE_SIZE;
    }

    createTripleAnnotations(groupedTriples, annotationPredicate, annotations) {
        return groupedTriples.flatMap((knowledgeAssetTriples, index) =>
            knowledgeAssetTriples.map(
                (triple) =>
                    `<< ${triple.replace(' .', '')} >> ${annotationPredicate} ${
                        annotations[index]
                    } .`,
            ),
        );
    }

    countDistinctSubjects(triples) {
        return kcTools.countDistinctSubjects(triples);
    }

    groupTriplesBySubject(triples, sort = true) {
        return kcTools.groupNquadsBySubject(triples, sort);
    }

    /**
     * Returns bindings with proper data types
     * @param bindings
     * @returns {*[]}
     */
    parseBindings(bindings = []) {
        const result = [];

        for (const row of bindings) {
            const obj = {};
            for (const columnName in row) {
                obj[columnName] = this._parseBindingDataTypes(row[columnName]);
            }
            result.push(obj);
        }

        return result;
    }

    /**
     * Returns cast binding value based on datatype
     * @param data
     * @returns {boolean|number|string}
     * @private
     */
    _parseBindingDataTypes(data) {
        const [value, dataType] = data.split('^^');

        switch (dataType) {
            case XML_DATA_TYPES.DECIMAL:
            case XML_DATA_TYPES.FLOAT:
            case XML_DATA_TYPES.DOUBLE:
                return parseFloat(JSON.parse(value));
            case XML_DATA_TYPES.INTEGER:
                return parseInt(JSON.parse(value), 10);
            case XML_DATA_TYPES.BOOLEAN:
                return JSON.parse(value) === 'true';
            default:
                return value;
        }
    }

    getPrivateAssertionId(publicAssertion) {
        const privateAssertionLinkTriple = publicAssertion.filter((triple) =>
            triple.includes(V0_PRIVATE_ASSERTION_PREDICATE),
        )[0];
        if (!privateAssertionLinkTriple) return;

        return privateAssertionLinkTriple.match(/"(.*?)"/)[1];
    }

    // Asumes nobody is using PRIVATE_HASH_SUBJECT_PREFIX subject in assertion
    quadsContainsPrivateRepresentations(quads) {
        return (
            quads[0].split(' ')[0].startsWith(`<${PRIVATE_HASH_SUBJECT_PREFIX}`) ||
            quads[quads.length - 1].split(' ')[0].startsWith(`<${PRIVATE_HASH_SUBJECT_PREFIX}`)
        );
    }

    generateHashFromString(string) {
        return this.cryptoService.sha256EncodePacked(['string'], [string]);
    }

    splitConnectedArrays(publicTriples) {
        const groupedPublic = [];
        let currentSubject = publicTriples[0].split(' ')[0];
        let currentSubjectHash = currentSubject.startsWith('<private-hash:0x')
            ? currentSubject
            : `<private-hash:${this.generateHashFromString(currentSubject.slice(1, -1))}>`;
        let currentKA = [publicTriples[0]];

        for (let i = 1; i < publicTriples.length; i += 1) {
            const [subject] = publicTriples[i].split(' ');

            const subjectHash = subject.startsWith('<private-hash:0x')
                ? subject
                : `<private-hash:${this.generateHashFromString(subject.slice(1, -1))}>`;

            if (
                currentSubject === subject ||
                currentSubjectHash === subject ||
                subjectHash === currentSubject
            ) {
                currentKA.push(publicTriples[i]);
            } else {
                groupedPublic.push(currentKA);
                currentSubject = subject;
                currentSubjectHash = subjectHash;
                currentKA = [publicTriples[i]];
            }
        }

        // Push the last group
        groupedPublic.push(currentKA);

        return groupedPublic;
    }

    insertStringInSortedArray(array, str) {
        // Assuming triplesArray is already sorted
        let left = 0;
        let right = array.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (array[mid].localeCompare(str) < 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        array.splice(left, 0, str);
        return left;
    }

    removeDuplicateObjectsFromArray(array) {
        const seen = new Set();
        return array.filter((item) => {
            const key = Object.values(item).join('_');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}

export default DataService;
