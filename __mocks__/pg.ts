const pg = jest.fn().mockImplementation(() => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    }
    const mPool = {
        connect: jest.fn().mockResolvedValue(mClient),
    };
    return { Pool: jest.fn(() => mPool) };
})

export default pg;