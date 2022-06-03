export interface IUser {
    name:string,
    email:string,
    password:string,
    phone: string,
    role:'examiner' |'examinee' |'admin',
    quizzes: string[],
    registerOn?: Date,
    isVerified?:boolean


}