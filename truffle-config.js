module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration> 
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            gas: 4600000,
            network_id: "*" // Match any network id
        }
    }
};