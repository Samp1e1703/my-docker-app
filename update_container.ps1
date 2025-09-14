# Остановка и удаление старого контейнера (если есть)
docker rm -f myapp_container 2>$null

# Сборка нового образа
docker build -t myapp:new .

# Запуск нового контейнера с переменной PORT
docker run -d -p 3000:3000 -e PORT=3000 --name myapp_container myapp:new
