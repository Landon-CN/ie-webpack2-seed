#!/bin/bash

# 下载图片

BASE_URL="https://static.360buyimg.com/im/w_web/img/classic/s"

for((i=1;i<=72;i++)); do
    url=${BASE_URL};
    
    if [ $i -lt 10 ]; 
    then
        url=${url}'0';
    fi
    curl -O $url${i}.gif
done