import { dataSource } from '../setup-e2e';

export const resetDatabase = async () => {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
};