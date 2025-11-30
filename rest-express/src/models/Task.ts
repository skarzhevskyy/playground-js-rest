import { getDatabase } from '../config/database.js';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export class TaskModel {
  static findAll(): Task[] {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');
    return stmt.all() as Task[];
  }

  static findById(id: number): Task | undefined {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | undefined;
  }

  static create(data: CreateTaskDTO): Task {
    const db = getDatabase();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.title,
      data.description || null,
      data.status || 'pending',
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, data: UpdateTaskDTO): Task | undefined {
    const db = getDatabase();
    const existing = this.findById(id);
    
    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(
      data.title ?? existing.title,
      data.description !== undefined ? data.description : existing.description,
      data.status ?? existing.status,
      now,
      id
    );
    
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

