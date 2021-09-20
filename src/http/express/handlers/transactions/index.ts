import { NextFunction, Request, Response } from "express";

const post = (req: Request, res: Response, _next: NextFunction) => {
    try {
        JSON.parse(req.body);
    } catch (err) {
        res.status(415).json();
    }
};

export {
    post
}