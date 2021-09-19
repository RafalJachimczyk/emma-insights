import { NextFunction, Request, Response } from "express";

const get = (req: Request, res: Response, _next: NextFunction) => {
    if(!req.query.user_id) {
        res.status(400).json();
    }
};

export {
    get
}