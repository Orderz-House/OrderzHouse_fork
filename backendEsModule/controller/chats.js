import { pool } from '../models/db.js';

const getMessagesByProjectId = async (req,res)=>{
    const {projectId} = req.params;
       pool.query(`SELECT 
  m.*,
  json_build_object(
    'id', u.id,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'username', u.username,
    'email', u.email,
    'sender_avatar', u.profile_pic_url
  ) AS sender
FROM messages m
JOIN users u ON u.id = m.sender_id
WHERE m.project_id = $1
ORDER BY m.time_sent ASC;`, [projectId]).then((result) => {
         res.status(200).json({messages: result });
       }).catch((err) => {
        res.status(500).json({test: "server error" });
       });
}


export {
    getMessagesByProjectId  
};

