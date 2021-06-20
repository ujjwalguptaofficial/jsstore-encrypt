
import { SelectQuery, IColumnOption } from 'jsstore';

declare module "jsstore" {
    interface IColumnOption {
        encrypt?: boolean
    }
    interface SelectQuery {
        encrypt?: boolean
        decrypt?: boolean;
    }
    interface IInsertQuery {
        encrypt?: boolean
    }
}