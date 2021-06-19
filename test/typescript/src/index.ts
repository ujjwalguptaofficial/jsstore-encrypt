import "./styles/app.css";
import { StudentLogic } from './business/student_logic';
import { initJsStore } from "./storage_service/idb_helper";

//initiate jsstore at the start of app
initJsStore().then(_ => {
    const studentLogic = new StudentLogic();
    setTimeout(() => {
        studentLogic.refreshStudentList();
    }, 1000);
})

