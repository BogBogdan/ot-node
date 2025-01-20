export async function up({ context: { queryInterface, Sequelize } }) {
    await queryInterface.createTable('paranet_kc', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        blockchain_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        ual: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        paranet_ual: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        error_message: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        is_synced: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        retries: {
            allowNull: false,
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
        },
        updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
        },
    });
    await queryInterface.addConstraint('paranet_kc', {
        fields: ['ual', 'paranet_ual'],
        type: 'unique',
    });
    await queryInterface.addIndex(
        'paranet_kc',
        ['paranetUal', 'isSynced', 'retries', 'updatedAt'],
        { name: 'idx_paranet_kc_sync_batch' },
    );

    const [[{ triggerInsertExists }]] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) AS triggerInsertExists
        FROM information_schema.triggers
        WHERE trigger_schema = DATABASE() AND trigger_name = 'after_insert_paranet_kc';
    `);
    if (triggerInsertExists === 0) {
        await queryInterface.sequelize.query(`
            CREATE TRIGGER after_insert_paranet_kc
            AFTER INSERT ON paranet_kc
            FOR EACH ROW
            BEGIN
                SET NEW.created_at = NOW();
            END;
        `);
    }

    const [[{ triggerUpdateExists }]] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) AS triggerUpdateExists
        FROM information_schema.triggers
        WHERE trigger_schema = DATABASE() AND trigger_name = 'after_update_paranet_kc';
    `);
    if (triggerUpdateExists === 0) {
        await queryInterface.sequelize.query(`
            CREATE TRIGGER after_update_paranet_kc
            AFTER UPDATE ON paranet_kc
            FOR EACH ROW
            BEGIN
                SET NEW.updated_at = NOW();
            END;
        `);
    }
}

export async function down({ context: { queryInterface } }) {
    await queryInterface.removeIndex('paranet_kc', 'idx_paranet_kc_sync_batch');
    await queryInterface.dropTable('paranet_kc');
}
