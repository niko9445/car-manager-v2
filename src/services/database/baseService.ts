// services/database/baseService.ts
import { supabase } from '../supabase/client';
import { convertKeysToSnakeCase, convertKeysToCamelCase } from '../../utils/convertCase';

export class BaseService {
  protected tableName: string;
  protected supabase;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.supabase = supabase;
  }

  // Оффлайн-кэш
  private getOfflineCacheKey(): string {
    return `offline_${this.tableName}`;
  }

  private async getOfflineData(): Promise<any[]> {
    try {
      const cached = localStorage.getItem(this.getOfflineCacheKey());
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private async setOfflineData(data: any[]): Promise<void> {
    try {
      localStorage.setItem(this.getOfflineCacheKey(), JSON.stringify(data));
    } catch (error) {
      console.error('❌ Ошибка сохранения в кэш:', error);
    }
  }

  private async addToOfflineQueue(operation: 'CREATE' | 'UPDATE' | 'DELETE', data: any): Promise<void> {
    try {
      const queueKey = `sync_queue_${this.tableName}`;
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      
      queue.push({
        operation,
        data,
        timestamp: Date.now(),
        id: data.id || `temp_${Date.now()}`
      });

      localStorage.setItem(queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('❌ Ошибка добавления в очередь синхронизации:', error);
    }
  }

  async create(data: any) {
    const dbData = convertKeysToSnakeCase(data);
    
    try {
      // Пытаемся сохранить в Supabase
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(dbData)
        .select();

      if (error) throw error;

      const converted = convertKeysToCamelCase(result[0]);
      
      // Сохраняем в кэш
      const cached = await this.getOfflineData();
      await this.setOfflineData([...cached, converted]);

      return converted;
    } catch (error) {
      // Если оффлайн - сохраняем в кэш и очередь синхронизации
      console.log('📴 Оффлайн режим, сохраняем локально');
      
      const tempData = {
        ...data,
        id: data.id || `temp_${Date.now()}`,
        _isOffline: true
      };

      const cached = await this.getOfflineData();
      await this.setOfflineData([...cached, tempData]);
      await this.addToOfflineQueue('CREATE', tempData);

      return tempData;
    }
  }

  async findById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return convertKeysToCamelCase(data);
    } catch (error) {
      // Если оффлайн - ищем в кэше
      const cached = await this.getOfflineData();
      const item = cached.find(item => item.id === id);
      return item ? { ...item, _fromCache: true } : null;
    }
  }

  async findByUser(userId: string) {
    try {
      // Пытаемся загрузить из Supabase
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const converted = data.map(convertKeysToCamelCase);
      
      // Сохраняем в кэш
      await this.setOfflineData(converted);

      return converted;
    } catch (error) {
      // Если оффлайн - загружаем из кэша
      console.log('📴 Оффлайн режим, загружаем из кэша');
      const cached = await this.getOfflineData();
      
      // Фильтруем только данные этого пользователя
      const userData = cached.filter(item => 
        !item._isOffline || item.userId === userId
      );

      return userData.map(item => ({
        ...item,
        _fromCache: true
      }));
    }
  }

  async update(id: string, updates: any) {
    const dbUpdates = convertKeysToSnakeCase(updates);
    
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(dbUpdates)
        .eq('id', id)
        .select();
      
      if (error) throw error;

      const converted = convertKeysToCamelCase(data[0]);
      
      // Обновляем кэш
      const cached = await this.getOfflineData();
      const updatedCache = cached.map(item => 
        item.id === id ? converted : item
      );
      await this.setOfflineData(updatedCache);

      return converted;
    } catch (error) {
      // Если оффлайн - обновляем кэш и добавляем в очередь
      console.log('📴 Оффлайн режим, обновляем локально');
      
      const cached = await this.getOfflineData();
      const itemToUpdate = cached.find(item => item.id === id);
      
      if (itemToUpdate) {
        const updatedItem = { ...itemToUpdate, ...updates, _isOffline: true };
        const updatedCache = cached.map(item => 
          item.id === id ? updatedItem : item
        );
        
        await this.setOfflineData(updatedCache);
        await this.addToOfflineQueue('UPDATE', updatedItem);
        
        return updatedItem;
      }
      
      throw new Error('Элемент не найден в кэше');
    }
  }

  async delete(id: string) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Удаляем из кэша
      const cached = await this.getOfflineData();
      const updatedCache = cached.filter(item => item.id !== id);
      await this.setOfflineData(updatedCache);

      return true;
    } catch (error) {
      // Если оффлайн - помечаем для удаления и добавляем в очередь
      console.log('📴 Оффлайн режим, помечаем для удаления');
      
      const cached = await this.getOfflineData();
      const itemToDelete = cached.find(item => item.id === id);
      
      if (itemToDelete) {
        const updatedCache = cached.filter(item => item.id !== id);
        await this.setOfflineData(updatedCache);
        await this.addToOfflineQueue('DELETE', { id });
        
        return true;
      }
      
      throw new Error('Элемент не найден в кэше');
    }
  }
}

// Сервис для синхронизации
export const syncService = {
  async syncTable(tableName: string): Promise<{ synced: number; errors: number }> {
    const queueKey = `sync_queue_${tableName}`;
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    let synced = 0;
    let errors = 0;

    for (const item of queue) {
      try {
        const { operation, data } = item;
        
        switch (operation) {
          case 'CREATE':
            await supabase.from(tableName).insert(convertKeysToSnakeCase(data));
            break;
          case 'UPDATE':
            await supabase.from(tableName).update(convertKeysToSnakeCase(data)).eq('id', data.id);
            break;
          case 'DELETE':
            await supabase.from(tableName).delete().eq('id', data.id);
            break;
        }
        
        synced++;
      } catch (error) {
        console.error(`❌ Ошибка синхронизации ${tableName}:`, error);
        errors++;
      }
    }

    // Очищаем очередь после синхронизации
    if (synced > 0) {
      localStorage.setItem(queueKey, '[]');
    }

    return { synced, errors };
  },

  async syncAllTables(userId: string): Promise<{ synced: number; errors: number }> {
    const tables = ['cars', 'maintenance', 'expenses', 'car_data'];
    let totalSynced = 0;
    let totalErrors = 0;

    for (const table of tables) {
      const result = await this.syncTable(table);
      totalSynced += result.synced;
      totalErrors += result.errors;
    }

    console.log(`✅ Синхронизация завершена: ${totalSynced} операций, ${totalErrors} ошибок`);
    return { synced: totalSynced, errors: totalErrors };
  }
};