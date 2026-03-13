import { IsString,} from 'class-validator';

export class CreateBookDto {
    @IsString()
    title!: string

    @IsString()
    author!: string

    @IsString()
    category!: string;
}
