//
//  ProxyServer.m
//  yeqq
//
//  Created by fxs on 15/5/21.
//  Copyright (c) 2015年 User. All rights reserved.
//  by Fanxiushu 2015-05-14

#include <sys/types.h>
#include <sys/stat.h>
#include <assert.h>
#include <ctype.h>
#include <errno.h>
#include <fcntl.h>
#include <stdarg.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <signal.h>
#include <errno.h>
#include <fcntl.h>
#include <netdb.h>
#include <pthread.h>
#include <stdarg.h>
#include <unistd.h>
#include <arpa/inet.h>  // For inet_pton() when NS_ENABLE_IPV6 is defined
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/select.h>

#import <Foundation/Foundation.h>


@interface ProxyPerClient : NSObject

@property(nonatomic) int sock;
@property(nonatomic,strong)NSURLConnection* conn;

@end
@implementation ProxyPerClient
-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
  NSLog(@"Response...");
  NSHTTPURLResponse* httpRes = (NSHTTPURLResponse*)response;
  int code = (int)[httpRes statusCode];
  
  char buf[4096];buf[0]=0;
  sprintf(buf,"HTTP/1.1 %d OK\r\n", code);
  NSDictionary* dict = [httpRes allHeaderFields];
  for(NSString* key in dict){
    NSString* val = [dict objectForKey:key];
    //     if( [key isEqualToString:@"Connection"]) continue;
    ///
    sprintf(buf+strlen(buf), "%s: %s\r\n", key.UTF8String, val.UTF8String);
  }
  //   sprintf( buf+strlen(buf), "Connection: close\r\n\r\n");
  sprintf(buf+strlen(buf), "\r\n");
  //////
  
  int r = -1;
  if(self.sock>=0)
    r = (int)send( self.sock, buf, (size_t)strlen(buf), 0);
  
  if(r<=0){
    [self.conn cancel];
    [self Close];
  }
  //   NSLog(@"**ReP: [%s]", buf);
}
-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
  //   NSLog(@"****^^^^ Recv DataLen=%d", (int)data.length);
  /////
  int r = -1;
  if(self.sock>=0){
    char* buf = (char*)malloc( data.length);
    memcpy(buf, data.bytes, data.length);
    
    r = (int)send( self.sock, buf, data.length, 0);
    
    free(buf);
  }
  
  if(r<=0){
    NSLog(@"**** Errno=%d", errno);
    [self.conn cancel];
    [self Close];
  }
  //    NSLog(@"**SEND=%d, ALL=%d", r, (int)data.length);
  
}
-(void)connectionDidFinishLoading:(NSURLConnection *)connection
{
  NSLog(@"proxy... Finish....");
  
  [self Close];
  
}
-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
  NSLog(@"*** proxyServer: Read URLConnection Error");
  /////
  [self Close];
  ////////
  
}

-(void)Close
{
  if(self.sock>=0){
    shutdown(self.sock, 2);
    close(self.sock);
    self.sock = -1;
  }
  ////
}

@end

/////
static int          proxy_listen_fd = -1;
static unsigned int proxy_restart_count = 0;
static int          proxy_listen_port=0;
/////////
static void do_client( int s)
{
  char buf[4096];
  int pos = 0;
  while(pos<4096){
    int r = (int)recv( s, (buf + pos), (size_t)(4096-pos), 0);
    if(r<=0){
      NSLog(@"**** proxyServer: Recv Header Error.");
      close(s);
      return ;
    }
    pos += r;
    buf[pos] = 0;
    char* ptr = strstr(buf,"\r\n\r\n");
    if( ptr ){
      *(ptr+2)=0;
      break;
    }
  }
  //   NSLog(@"**** proxyServer HEader:[%s]",buf);
  
  char* hdr = buf;
  char* range = NULL;
  const char* t="Range: "; int ll = (int)strlen(t);
  while(hdr){
    char* e = strstr( hdr, "\r\n"); if(!e)break;
    *e = 0;
    ///
    //  NSLog(@"[%s]", hdr);
    if(strncasecmp(hdr, t, ll ) ==0 ){
      range = hdr + ll;
    }
    ///
    hdr = e+2; ////
  }
  ////////
  char* uri = strchr( buf,' '); if(!uri) {close(s);return;}
  uri++;
  char* end = strchr( uri, ' '); if(!end){close(s);return;}
  *end = 0;
  //////////
  NSLog(@"URI=[%s]", uri);
  
  //   NSString* strurl=@"http://kingofspeed.cn/download/movie/IcelandWaterfall.mp4";
  
  NSString* strurl = [NSString stringWithUTF8String:(uri+1)]; /////
  
  NSMutableURLRequest* request = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:strurl]
                                                              cachePolicy:NSURLRequestReloadIgnoringLocalCacheData
                                                          timeoutInterval:10.0];
  if(range){
    
    [request setValue:[NSString stringWithUTF8String:range] forHTTPHeaderField:@"Range"];
    //////
  }
  
  ProxyPerClient* proxy = [[ProxyPerClient alloc]init];
  proxy.sock = s;
  
  //////
  NSURLConnection* conn = [[NSURLConnection alloc] initWithRequest:request delegate:proxy startImmediately:NO];
  
  proxy.conn = conn;
  
  [conn setDelegateQueue:[[NSOperationQueue alloc]init]]; /// enter Queue for execute
  
  [conn start];
  
  //   NSLog(@"^^^^^ [%s]", buf);
  /////
  
}

static int create_proxy_listen_socket(const char* strip, int port)
{
  if(proxy_listen_fd>=0){
    close(proxy_listen_fd);
    proxy_listen_fd = -1;
    ////
  }
  
  int fd = socket(AF_INET, SOCK_STREAM,0);
  if(fd<0) return -1;
  
  int set = 1;
  setsockopt(fd, SOL_SOCKET, SO_NOSIGPIPE, (void*)&set, sizeof(int));
  
  setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, (void*)&set, sizeof(int)); // reuse address
  
  struct sockaddr_in addr; memset(&addr,0,sizeof(addr));
  addr.sin_family=AF_INET;
  addr.sin_addr.s_addr = inet_addr(strip);
  addr.sin_port = htons(port);
  
  if( bind(fd, (struct sockaddr*)&addr, sizeof(addr) ) <0 ){
    close(fd);
    NSLog(@"ProxyServer: bind error.");
    return -1;
  }
  
  listen(fd,5);
  proxy_listen_fd = fd;
  
  /////
  memset(&addr, 0, sizeof(addr)); socklen_t len =sizeof(addr);
  getsockname(fd, (struct sockaddr*)&addr, &len);
  
  proxy_listen_port = ntohs( addr.sin_port); //////
  
  NSLog(@"Listen [%s:%d]", inet_ntoa(addr.sin_addr), ntohs(addr.sin_port));
  
  ///
  return fd;
}

int start_proxy_server(const char* strip, int port)
{
  signal(SIGPIPE, SIG_IGN);
  
  unsigned int restart_count = proxy_restart_count; ////
  
  //////
  int fd = create_proxy_listen_socket(strip, port);
  
  if( fd < 0 ){
    NSLog(@":: Create Proxy Server Error.");
    return -1;
  }
  /////
  
  dispatch_async(dispatch_get_global_queue(0, 0), ^{
    
    int listen_fd = proxy_listen_fd;
    ////
    int err=0;
    while( restart_count == proxy_restart_count ){
      ///
      fd_set rdst;FD_ZERO(&rdst); FD_SET( listen_fd, &rdst);
      struct timeval timeout; timeout.tv_sec = 1; timeout.tv_usec = 0;
      int status = select(listen_fd + 1, &rdst, NULL, NULL, &timeout);
      if( status <=0){
        if(status < 0){
          ++err;
          /////
          if(err>=30){
            NSLog(@"*** proxy FALTAL Error.**** recreate Listen socket");
            while( restart_count ==proxy_restart_count){
              //
              listen_fd = create_proxy_listen_socket(strip, port); if(listen_fd>=0)break;
              sleep(1);
            }
            err=0;
          }
          
        }else {
          err = 0;
        }
        ///
        continue;
      }
      err = 0;
      ////
      int s = accept(listen_fd, NULL, NULL); if(s <0){++err; continue;}
      ///
      dispatch_async(dispatch_get_global_queue(0, 0), ^{
        int set = 1;
        setsockopt(fd, SOL_SOCKET, SO_NOSIGPIPE, (void*)&set, sizeof(int));
        do_client(s);
      } );
      ///////
      
    }
    //////
    close(proxy_listen_fd);
    proxy_listen_fd = -1; /////
    
    NSLog(@"**** Proxy Server Listen Closed.");
    ////////
  });
  ////////
  return 0;
}

void stop_proxy_server()
{
  ++proxy_restart_count; ///
}
int get_proxy_port()
{
  return proxy_listen_port;
}


