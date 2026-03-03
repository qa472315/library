// import { Module, Global } from '@nestjs/common';
// import { AppDataSource } from './DataSource';
// import { DataSource } from 'typeorm';

// let dataSource: DataSource;

// @Global()
// @Module({
//   providers: [
//     {
//       provide: 'DATA_SOURCE',
//       useFactory: async () => {
//         // initialize 是 typeorm 自帶用於確認是否已經初始化
//         if (dataSource && dataSource.isInitialized) {
//           return dataSource;
//         }

//         dataSource = await AppDataSource.initialize();
//         console.log('DB type =', AppDataSource.options.type);
//         console.log(
//           'entities =',
//           AppDataSource.entityMetadatas.map(e => e.tableName),
//         );
//         console.log('synchronize =', process.env.NODE_ENV);
//         return dataSource;
//       },
//     },
//   ],
//   exports: ['DATA_SOURCE'],
// })
// export class DatabaseModule {}