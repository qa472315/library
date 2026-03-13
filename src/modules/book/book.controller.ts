import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwtAuthGuard'

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: '新增書籍' })
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '取得所有書籍' })
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Post(':id/borrow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '借閱書籍' })
  borrow(@Param('id') id: string) {
    // return this.bookService.borrow(id);
  }

  @Post(':id/return')
  @ApiOperation({ summary: '歸還書籍' })
  return(@Param('id') id: string) {
    // return this.bookService.return(id);
  }
}
