package com.example.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CacheService {
    private static final Logger log = LoggerFactory.getLogger(CacheService.class);
    
    private static final String USER_CACHE_PREFIX = "user:";
    private static final String STATS_CACHE_PREFIX = "stats:";
    private static final String TODO_CACHE_PREFIX = "todo:";
    private static final String TIMER_CACHE_PREFIX = "timer:";
    
    private static final long USER_CACHE_TTL = 30;
    private static final long STATS_CACHE_TTL = 5;
    private static final long TODO_CACHE_TTL = 10;
    private static final long TIMER_CACHE_TTL = 5;
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    public CacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    
    public void cacheUser(Long userId, Object userData) {
        String key = USER_CACHE_PREFIX + userId;
        redisTemplate.opsForValue().set(key, userData, USER_CACHE_TTL, TimeUnit.MINUTES);
        log.debug("Cached user data for userId: {}", userId);
    }
    
    public Object getUser(Long userId) {
        String key = USER_CACHE_PREFIX + userId;
        return redisTemplate.opsForValue().get(key);
    }
    
    public void evictUser(Long userId) {
        String key = USER_CACHE_PREFIX + userId;
        redisTemplate.delete(key);
        log.debug("Evicted user cache for userId: {}", userId);
    }
    
    public void cacheStats(Long userId, Object statsData) {
        String key = STATS_CACHE_PREFIX + userId;
        redisTemplate.opsForValue().set(key, statsData, STATS_CACHE_TTL, TimeUnit.MINUTES);
        log.debug("Cached stats for userId: {}", userId);
    }
    
    public Object getStats(Long userId) {
        String key = STATS_CACHE_PREFIX + userId;
        return redisTemplate.opsForValue().get(key);
    }
    
    public void evictStats(Long userId) {
        String key = STATS_CACHE_PREFIX + userId;
        redisTemplate.delete(key);
        log.debug("Evicted stats cache for userId: {}", userId);
    }
    
    public void cacheTodo(Long userId, Long todoId, Object todoData) {
        String key = TODO_CACHE_PREFIX + userId + ":" + todoId;
        redisTemplate.opsForValue().set(key, todoData, TODO_CACHE_TTL, TimeUnit.MINUTES);
        log.debug("Cached todo for userId: {}, todoId: {}", userId, todoId);
    }
    
    public Object getTodo(Long userId, Long todoId) {
        String key = TODO_CACHE_PREFIX + userId + ":" + todoId;
        return redisTemplate.opsForValue().get(key);
    }
    
    public void evictTodo(Long userId, Long todoId) {
        String key = TODO_CACHE_PREFIX + userId + ":" + todoId;
        redisTemplate.delete(key);
        log.debug("Evicted todo cache for userId: {}, todoId: {}", userId, todoId);
    }
    
    public void evictAllTodos(Long userId) {
        var keys = redisTemplate.keys(TODO_CACHE_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.debug("Evicted all todo caches for userId: {}", userId);
        }
    }
    
    public void cacheTimerRecords(Long userId, Object recordsData) {
        String key = TIMER_CACHE_PREFIX + userId;
        redisTemplate.opsForValue().set(key, recordsData, TIMER_CACHE_TTL, TimeUnit.MINUTES);
        log.debug("Cached timer records for userId: {}", userId);
    }
    
    public Object getTimerRecords(Long userId) {
        String key = TIMER_CACHE_PREFIX + userId;
        return redisTemplate.opsForValue().get(key);
    }
    
    public void evictTimerRecords(Long userId) {
        String key = TIMER_CACHE_PREFIX + userId;
        redisTemplate.delete(key);
        log.debug("Evicted timer records cache for userId: {}", userId);
    }
    
    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
    
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }
    
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
    
    public void delete(String key) {
        redisTemplate.delete(key);
    }
}