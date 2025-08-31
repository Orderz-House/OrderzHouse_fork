import { pool } from '../models/db.js';

const getMessagesByProjectId = async (req,res)=>{
    const {projectId} = req.params;
    

       pool.query(`SELECT * FROM messages WHERE project_id = $1`, [projectId]).then((result) => {
         res.status(200).json({messages: result });
       }).catch((err) => {
        res.status(500).json({test: "server error" });
       });

        
       

   
}




export {
    getMessagesByProjectId  
};

