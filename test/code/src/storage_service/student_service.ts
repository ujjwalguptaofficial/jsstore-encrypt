import { BaseService } from './base_service';
import { Student } from '../model/student';

export class StudentService extends BaseService {

    getStudents() {
        return this.connection.select<Student>({
            from: 'Students',
            decrypt: true
        } as any);
    }

    addStudent(student: Student) {
        return this.connection.insert({
            into: 'Students',
            values: [student],
            encrypt: true
        } as any);
    }

    deleteStudent(studentId: number) {
        return this.connection.remove({
            from: 'Students',
            where: {
                id: studentId
            }
        });
    }

    getStudent(studentId: number) {
        return this.connection.select<Student>({
            from: 'Students',
            where: {
                id: studentId
            }
        });
    }

    updateStudent(studentId: number, value) {
        return this.connection.update({
            in: 'Students',
            set: value,
            where: {
                id: studentId
            }
        });
    }
}