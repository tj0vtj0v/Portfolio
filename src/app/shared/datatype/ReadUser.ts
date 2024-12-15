import {Role} from './Role';

export interface ReadUser {
    first_name: string
    last_name: string
    email: string
    username: string
    role: Role
}
