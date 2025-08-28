import { pool } from "../models/db.js";

const getMessageLogs = ((req,res)=>{
    pool.query('SELECT * FROM message_logs').then((result) => {
        res.status(200).json({
            success : true,
            message : "Message Logs Successfully",
            logs : result.rows
        })
    }).catch((err) => {
            res.status(500).json({
            success : false,
            message : "Server Error",
            error : err
        })
    });
})

export {
    getMessageLogs
}