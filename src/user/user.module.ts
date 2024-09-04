import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }])], // Conexão/Criação com a collection 'Users'
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
