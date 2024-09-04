import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletSchema } from './wallet.schema';
import { UserModule } from 'src/user/user.module';
import { UserSchema } from 'src/user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Wallet', schema: WalletSchema }]), // Conexão/Criação com a collection 'Wallet'
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]), // Conexão/Criação com a collection 'Users'
    UserModule],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
