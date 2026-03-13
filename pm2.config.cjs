module.exports = {
    apps: [
        {
            name: "fly-dbh-v2",
            script: "server/main.mjs",
            exec_mode: "cluster",
            instances: "2",
            max_memory_restart: "256M",
            out_file: ".logs/server.log",
            error_file: ".logs/server-error.log",
        },
        {
            name: "fly-dbh-v2-next",
            script: "server/main.mjs",
            exec_mode: "cluster",
            instances: "1",
            max_memory_restart: "120M",
            out_file: ".logs/server.log",
            error_file: ".logs/server-error.log",
        },
    ],
};
