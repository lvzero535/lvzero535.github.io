# koa和typescript后端实现Demo

## 前言

对`TypeScript` 神往已久，看过`Angular 4+` 写过小Demo，没用它写过后端，一直想通过`TypeScript`写一个Demo后端，听说`Nestjs` 和`Java` 的`Spring` 有的一拼，但没上手，只能用`Koa` 来凑，后续用`Nestjs`补上。这只是一个后端，没有前端页面。
具体代码:[Github地址](https://github.com/lvzero535/daily_code/tree/master/koa-ts)

## 安装依赖

```javascript
npm intall koa koa-bodyparser koa-router
npm intall typeorm reflect-metadata mysql2
npm install @types/koa @types/koa-bodyparser @types/koa-router -D
npm install nodemon ts-node typescript -D
```

依赖中值得注意的是：

- `nodemon ` 改动代码后node启动的服务器不会自动刷新，修改后的代码就不生效，要重启才生效。这个工具就是实时监控代码改变后自动重启服务器的。详情看：

  [https://github.com/remy/nodemon](https://github.com/remy/nodemon)



- `ts-node``typescript`代码正常来说要转译才可以运行，但是这个工具提供了运行环境。

- `reflect-metadata` `typeorm` 需要`ES7 ` 装饰器，需要这个依赖。由于`typescript`的装饰器是实验功能，所以在`tsconfig.json` 时要配置，不然报错。

  ```json
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
  ```

  

## 代码实现

第一步，连接数据库，启动服务监听端口，连接是全局的，详情看 [https://github.com/typeorm/typeorm](https://github.com/typeorm/typeorm)

```typescript
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import { createConnection } from 'typeorm';
import User from './entities/user';
import routes from './routes';

createConnection({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "username",
  password: "password",
  database: "database",
  entities: [
    User // 实体对象
  ],
  synchronize: true,
  logging: false
}).then(connection => {

  const app = new Koa();

  app.use(bodyParser());
  
  const router = new Router();
  router.use(routes.routes());
  app.use(router.routes()).use(router.allowedMethods());
  
  app.listen(8888, () => {
    console.log('starting -------')
  })
}).catch(err => console.log('typeorm connect failed,', err))
```

第二步是，定义表实体，装饰器详情看`typeorm`文档

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 20
  })
  username: string;

  @Column({
    length: 40
  })
  password: string;

  @Column({
    length: 11
  })
  phone: string;

  @Column({
    length: 40
  })
  email: string;

  @Column({
    length: 1
  })
  gender: string;
}
```

第三步是写操作数据库的实现

```typescript
// service 直接操作实体对象就可以，像java的hibernate
import { Repository, getRepository } from "typeorm";
import User from "../entities/user";

export default class UserService {
  private static repositoryUser(): Repository<User> {
    return getRepository(User);
  }

  public static async getUsers() {
    return this.repositoryUser().find();
  }

  public static async getUserById(id: string) {
    return this.repositoryUser().findOne(id);
  }

  public static async addAndUpdateUser(user: User) {
    return this.repositoryUser().save(user);
  }

  public static async deleteUser(user: User) {
    return this.repositoryUser().remove(user);
  }
}
```

```typescript
// 控制器，路由过来的请求处理
import { BaseContext } from "koa";
import UserService from "./service";
import User from "../entities/user";

export default class UserController {

  public static async getUsers(ctx: BaseContext) {
    const users: User[] = await UserService.getUsers()
    ctx.status = 200;
    ctx.body = users;
  }

  public static async getUserById(ctx: BaseContext) {
    ctx.status = 200;
    ctx.body = await UserService.getUserById(ctx.params.id);
  }
  
  public static async addUser(ctx: BaseContext) {
    const user: User = ctx.request.body;
    ctx.status = 200; 
    ctx.body = await UserService.addAndUpdateUser(user);
  }

  public static async updateUser(ctx: BaseContext) {
    const findUser = await UserService.getUserById(ctx.params.id);
    if(!findUser) {
      ctx.status = 400;
      ctx.body = 'user is not exists!'
    } else {
      ctx.status = 200; 
      ctx.body = await UserService.addAndUpdateUser(Object.assign(findUser, ctx.request.body));
    }
  }

  public static async deleteUser(ctx: BaseContext) {
    const findUser = await UserService.getUserById(ctx.params.id);
    if(!findUser) {
      ctx.status = 400;
      ctx.body = 'user is not exists!'
    } else {
      ctx.status = 204; 
      await UserService.deleteUser(findUser);
    }
  }
}
```

```typescript
// 路由定义，符合REST Ful规范
import * as Router from 'koa-router';
import controller from './controller';
const router = new Router();

router.get('/users', controller.getUsers);
router.get('/users/:id', controller.getUserById);
router.post('/users', controller.addUser);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

export default router;
```

## 实践

启动 `npm start` 

```javascript
[nodemon] 1.19.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: f:\ProcedureDocument\CodeHome\js\node\koa-ts\server/**/*
[nodemon] starting `ts-node ./server/index.ts`
```

最后用Postman测试各接口没问题。

这是简单的实现，什么都没有，只有接口，没有权限控制，没有测试，没有前端，当然这是为`nestjs`铺垫，当然后面有时间会补齐。
