import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

//load environment variables from .env file
dotenv.config();

const auth = (req, res, next) => {
    //get token from header
    const token = req.header("x-auth-token");

    //check if no token
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //add user from payload to request object
        req.user = decoded.user;
        next();
        } catch (error) {
        res.status(401).json({ msg: "Token is not valid" });
        }
    };

    export default auth;