# Python定时器实现

## 时间转换

```python
import time, datetime

times = 2017-12-03 14:27:03 #当前时间
        
print time.time() 
# 当前时间戳
#1512282423.23

struct_time = time.localtime(time.time()) #时间结构化
print  struct_time 
#time.struct_time(tm_year=2017, tm_mon=12, tm_mday=3, tm_hour=14, tm_min=27, tm_sec=3, tm_wday=6, tm_yday=337, tm_isdst=0)
#tm_wday,当前星期几，0是星期一，tm_isdst 夏令时间， tm_yday当年的第几天

strtime = time.strftime('%Y-%m-%d %H:%M:%S', struct_time)
print strtime #结构化时间转换成字符串
#2017-12-03 14:27:03

struct_time = time.strptime(strtime, '%Y-%m-%d %H:%M:%S') #字符串转换成结构化时间
print struct_time
#time.struct_time(tm_year=2017, tm_mon=12, tm_mday=3, tm_hour=14, tm_min=27, tm_sec=3, tm_wday=6, tm_yday=337, tm_isdst=0)
#tm_wday,当前星期几，0是星期一，tm_isdst 夏令时间， tm_yday当年的第几天

timestrap = time.mktime(struct_time) #结构化时间转换成时间戳
print timestrap
#1512282423.0

struct_time = time.localtime(timestrap)
print struct_time
print time.strftime('%Y-%m-%d %H:%M:%S', struct_time)

struct_time = time.strptime("2017-08-08 12:12", '%Y-%m-%d %H:%M')
print struct_time
#time.struct_time(tm_year=2017, tm_mon=8, tm_mday=8, tm_hour=12, tm_min=12, tm_sec=0, tm_wday=1, tm_yday=220, tm_isdst=-1)
y,m,d,h,M = struct_time[0:5] #获取元组前5个元素
print y,m,d,h,M # 2017 8 8 12 12

print datetime.datetime(y,m,d,h,M) #2017-08-08 12:12:00

datetime.datetime.strptime("2017-08-08 12:12", '%Y-%m-%d %H:%M')
#字符转换成datetime

now=datetime.datetime.now() #获取当前时间
print now #2017-12-03 14:44:45.056000

sched_Timer=datetime.datetime(2017,2,9,20,20,10)
print type(sched_Timer) #<type 'datetime.datetime'>
print sched_Timer #2017-02-09 20:20:10

sched_Timer=sched_Timer + datetime.timedelta(minutes=10)
print sched_Timer #2017-02-09 20:30:10

#datetime.timedelta(minutes=10) 当前时间加参数里对应的时间，days,hours,minutes,seconds
```



## datetime方式

```python
import datetime
def run_Task():
    print 'hello'

def timerFun(sche_timer):
    flag = 0
    while True: 
        now = datetime.datetime.now()
        if now == sche_timer and flag == 0: 
            run_Task()
            flag = 1
        else:
            if flag == 1:
                sche_timer = sche_timer + datetime.timedelta(seconds=5)
                flag = 0

def main():
    sche_timer = datetime.datetime(2017, 12, 3, 12, 41, 30)
    timerFun(sche_timer)

if __name__ == '__main__':
    main()
```

## sched方式

> schedule这个家伙就像一个预存你要定时执行的任务们儿 的盒子。 schedule.enter就是把你要定时多少秒后执行的任务放到这个盒子里去。而schedule.run就是这时候去run你盒子的所有任务，任务就在这个时刻后，依次相对于这个时刻点的多少秒后运行。如果没有run，那可是不会让盒子的任务被执行。
>
> 为什么每一行输出的最后一个时间数据都是一样的（除了最后一行）？因为他们传入函数的数据是当时运行schedule.enter的那个时间点，并非是你定时运行的那个时刻。
>
> 而输出中“now is  什么什么”的那个时刻，是运行的func函数中的time.time()，所以代表的是实际运行那个任务的时刻，所以不是一样的。


> schedule.enter(delay, priority, action, arguments)
>
> 第一个参数是一个整数或者float，代表多少秒后执行这个action任务。
>
> 第二个参数priority是优先级，0代表优先级最高，1次之，2次次之…当两个任务是预定在同一个时刻执行时，根据优先级决定谁先执行。
>
> 第三个参数就是你要执行的任务，可以简单的理解成你要执行的函数的函数名。
>
> 第四个参数是你要传入的这个定时执行的action为函数名的函数的参数，最好是用"()"括号来包起来，包起来肯定是不会出错的。其次，当你只传入一个参数时，用括号包起来后，一定要记住再打上一个逗号。即：**schedule.enter(delay, priority, action, (argument1,))** 

```python
import time, sched

schedule = sched.scheduler( time.time, time.sleep)

def func(str, flo):
    print 'now is', time.time(), " | ouput", str, flo

print time.time()

schedule.enter(2, 0, func, ("test1", time.time()))
schedule.enter(2, 0, func, ("test2", time.time()))
schedule.enter(3, 0, func, ("test3", time.time()))
schedule.enter(4, 0, func, ("test4", time.time()))
schedule.run()

print time.time()
```

## timer时间器

> 单线程方式

```python
import time, threading

def fun_timer(key):
    print "hello world", key
    global timer
    timer = threading.Timer(5.5, fun_timer,('seconds',))
    timer.start()

"""Call a function after a specified number of seconds"""
timer = threading.Timer(1, fun_timer, ("fisrt",))
timer.start()

time.sleep(12)
timer.cancel()
```

> 多线程方式

```python
import time
from threading import Timer

def print_time( enter_time ):
    print 'now is', time.time(), 'enter_the_box_time is', enter_time

print time.time()
Timer(5, print_time, (time.time(),)).start()
Timer(5, print_time, (time.time(),)).start()
print time.time()
```