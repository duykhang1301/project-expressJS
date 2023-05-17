"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Posts", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            description: {
                type: Sequelize.TEXT,
            },
            viewMode: {
                type: Sequelize.STRING,
            },
            likesCount: {
                type: Sequelize.INTEGER,
            },
            commentsCount: {
                type: Sequelize.INTEGER,
            },
            sharesCount: {
                type: Sequelize.INTEGER,
            },
            allows: {
                type: Sequelize.STRING,
            },
            status: {
                type: Sequelize.STRING,
            },
            userId: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Posts");
    },
};
