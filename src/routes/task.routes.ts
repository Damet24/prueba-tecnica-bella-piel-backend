import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { MysqlTaskRepository } from '../infrastructure/repositories/mysql-task.repository';
import { env } from '../config/env.config';

export function register(router: Router): void {
  const repository = new MysqlTaskRepository();
  const service = new TaskService(repository);
  const controller = new TaskController(service);

  const basePath = env.api.basePath;

  /**
   * @openapi
   * components:
   *   schemas:
   *     Task:
   *       type: object
   *       required:
   *         - id
   *         - titulo
   *         - estado
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *         titulo:
   *           type: string
   *         descripcion:
   *           type: string
   *         estado:
   *           type: string
   *           enum: [pendiente, en progreso, completada]
   *         fecha_creacion:
   *           type: string
   *           format: date-time
   *         fecha_actualizacion:
   *           type: string
   *           format: date-time
   *         fecha_eliminacion:
   *           type: string
   *           format: date-time
   *           nullable: true
   *     CreateTaskInput:
   *       type: object
   *       required:
   *         - titulo
   *       properties:
   *         titulo:
   *           type: string
   *         descripcion:
   *           type: string
   *         estado:
   *           type: string
   *           enum: [pendiente, en progreso, completada]
   *     UpdateTaskInput:
   *       type: object
   *       properties:
   *         titulo:
   *           type: string
   *         descripcion:
   *           type: string
   *         estado:
   *           type: string
   *           enum: [pendiente, en progreso, completada]
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         error:
   *           type: string
   *         code:
   *           type: string
   */

  /**
   * @openapi
   * /tasks:
   *   get:
   *     tags: [Tasks]
   *     summary: Listar todas las tareas
   *     responses:
   *       200:
   *         description: Lista de tareas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   */
  router.get(`${basePath}/tasks`, controller.getAll);

  /**
   * @openapi
   * /tasks/{id}:
   *   get:
   *     tags: [Tasks]
   *     summary: Obtener una tarea por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: UUID de la tarea
   *     responses:
   *       200:
   *         description: Tarea encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get(`${basePath}/tasks/:id`, controller.getById);

  /**
   * @openapi
   * /tasks:
   *   post:
   *     tags: [Tasks]
   *     summary: Crear una nueva tarea
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTaskInput'
   *     responses:
   *       201:
   *         description: Tarea creada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Error de validación
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post(`${basePath}/tasks`, controller.create);

  /**
   * @openapi
   * /tasks/{id}:
   *   put:
   *     tags: [Tasks]
   *     summary: Actualizar una tarea
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: UUID de la tarea
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTaskInput'
   *     responses:
   *       200:
   *         description: Tarea actualizada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Error de validación
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put(`${basePath}/tasks/:id`, controller.update);

  /**
   * @openapi
   * /tasks/{id}:
   *   delete:
   *     tags: [Tasks]
   *     summary: Eliminar una tarea (soft delete)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: UUID de la tarea
   *     responses:
   *       204:
   *         description: Tarea eliminada (sin contenido)
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete(`${basePath}/tasks/:id`, controller.delete);
}
