// 定义对象结构，最常用的场景之一
interface User {
  id: number;
  name: string;
  age?: number; // 可选属性
  readonly email: string; // 只读属性
}

// 扩展接口
interface Employee extends User {
  department: string;
  salary: number;
}

// 实际使用
const user: User = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
};
console.log(user.age?.toString());
