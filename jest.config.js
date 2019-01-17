module.exports = {
    moduleFileExtensions: ["ts", "tsx", "js", "json"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json"
        }
    },
    testMatch: ["**/__tests__/**/*.ts?(x)","**/?(*.)+(spec|test).ts?(x)"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/", "/lib/"],
    verbose: true,
    testURL: "http://localhost/"
};