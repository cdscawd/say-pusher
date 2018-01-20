
## Start

dev
```
  $ npm i
  $ npm run start
```

sercer
```
$ sudo npm install forever -g   		#安装
$ forever start ./bin/www          	#启动
$ forever stop ./bin/www           	#关闭
$ forever start -l forever.log -o out.log -e err.log ./bin/www   #输出日志和错误
or
$ forever start -a -l forever.log -o bin/log/out.log -e bin/log/out.log bin/www
```

#URL
 Teacher server port is 8001 (/bin/www)
 Index Page(/view/index.ejs):
 ```
	sessionRequestId=58d1b23d602a4a0001e66f33
	sessionStartAt=1507073590164
	sessionEndAt=1507679587594
	lessonSlug=1072_2932_34582
	URL: http://localhost:8001/teacher?sessionRequestId=58d1b873d602a4a0001e66ac6&sessionStartAt=1507073590164&sessionEndAt=1507679587594&lessonSlug=1072_2932_34572
 ```

Bug Tip
```
[root@mango VoIP-Teacher]# forever start bin/www
warn:    --minUptime not set. Defaulting to: 1000ms
warn:    --spinSleepTime not set. Your script will exit if it does not stay up for at least 1000ms
info:    Forever processing file: bin/www
error:   Cannot start forever
error:   log file /root/.forever/forever.log exists. Use the -a or --append option to append log.
[root@mango VoIP-Teacher]# forever start -a -l forever.log -o out.log -e err.log bin/www
```

### 本次版本更新内容
    * 2018/01/20
    * 本次版本号："version": "0.0.11"
    * 上次版本号："version": "0.0.1"；
    内容：
        - 同步细节处理

### 历史版本更新内容
     