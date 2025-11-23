// services/database/articles.ts
import { BaseService } from './baseService';
import { Article } from '../../types';

export class ArticleService extends BaseService {
  constructor() {
    super('articles');
  }

  async createArticle(carId: string, data: {
    category: string;
    subcategory: string;
    articleNumber: string;
  }): Promise<Article> {
    const article = await this.create({
      ...data,
      car_id: carId,
      article_number: data.articleNumber // соответствие с названием колонки в БД
    });

    return this.mapToArticle(article);
  }

  async getArticlesByCar(carId: string): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToArticle(item));
  }

  async updateArticle(articleId: string, updates: {
    category?: string;
    subcategory?: string;
    articleNumber?: string;
  }): Promise<Article> {
    const updatedData: any = { ...updates };
    if (updates.articleNumber) {
      updatedData.article_number = updates.articleNumber;
      delete updatedData.articleNumber;
    }

    const updated = await this.update(articleId, updatedData);
    return this.mapToArticle(updated);
  }

  async deleteArticle(articleId: string): Promise<void> {
    await this.delete(articleId);
  }

  // Специальные методы для фильтрации по категориям
  async getArticlesByCategory(carId: string, category: string): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToArticle(item));
  }

  async getArticlesBySubcategory(carId: string, subcategory: string): Promise<Article[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .eq('subcategory', subcategory)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToArticle(item));
  }

  private mapToArticle(dbArticle: any): Article {
    return {
      id: dbArticle.id,
      category: dbArticle.category,
      subcategory: dbArticle.subcategory,
      articleNumber: dbArticle.article_number, // маппинг из БД
      createdAt: dbArticle.created_at,
      updatedAt: dbArticle.updated_at,
      carId: dbArticle.car_id
    };
  }
}

export const articleService = new ArticleService();