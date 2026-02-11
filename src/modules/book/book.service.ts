import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity'

@Injectable()
export class BookService {
  private books:Book[] = [];
  create(dto: CreateBookDto) :Book{
    const book:Book = {
      id: crypto.randomUUID(),
      title: dto.title,
      author: dto.author,
      isAvailable: true
    }
    this.books.push(book) 
    return book;
  }

  findAll():Book[] {
    return this.books;
  }

  findOne(id: string):boolean | Book {
    const book = this.books.find(b => b.id === id);
    if(!book)return false;
    return book;
  }

  borrow(id: string):boolean {
    const book = this.books.find(b => b.id === id && b.isAvailable);
    if(!book) return false;
    book.isAvailable = false;
    return true;
  }

  return(id: string): boolean {
    const book = this.books.find(b => b.id === id && !b.isAvailable);
    if(!book) return false;
    book.isAvailable = true;
    return true;
  }
}
