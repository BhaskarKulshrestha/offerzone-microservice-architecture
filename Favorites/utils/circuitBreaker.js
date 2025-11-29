const CircuitBreaker = require("opossum");
const logger = require("./logger");

const options = {
    timeout: 3000, // If function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
    resetTimeout: 10000, // After 10 seconds, try again.
};

const createBreaker = (asyncFunction, fallbackFunction = null) => {
    const breaker = new CircuitBreaker(asyncFunction, options);

    breaker.fallback((...args) => {
        if (fallbackFunction) {
            return fallbackFunction(...args);
        }
        return { error: "Service Unavailable", fallback: true };
    });

    breaker.on("open", () => logger.warn(`Circuit Breaker OPEN for ${asyncFunction.name}`));
    breaker.on("close", () => logger.info(`Circuit Breaker CLOSED for ${asyncFunction.name}`));
    breaker.on("halfOpen", () => logger.info(`Circuit Breaker HALF-OPEN for ${asyncFunction.name}`));

    return breaker;
};

module.exports = createBreaker;
