# Informando a versão do node
FROM node:20.16.0

# Definindo o diretório
WORKDIR ./

# Copiar todos os arquivos presentes no diretório
COPY . .

# Instalar as dependências
RUN npm i 

# Compilar os arquivos TypeScript
RUN npm run build 

# Porta que a aplicação vai rodar
EXPOSE 3000

# Executar a aplicação em modo produção
CMD ["npm", "run", "start:prod"]