const { Router } = require('express');
const router = Router();

const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/index.controller');

// Se definen las rutas que tendrá la API
router.post('/task/create', createTask);
router.get('/task/:sort?/:type?', getTasks);
router.get('/task//:type?', getTasks);
// router.get('/task/:id', getTaskById);
router.delete('/task/:id', deleteTask);
// router.post('/task/:id', updateTask); En el ejercicio viene de forma ambigua uso PUT ya que se adecua mas a lo que necesito
router.put('/task/update', updateTask); 

module.exports = router;