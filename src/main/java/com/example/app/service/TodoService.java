package com.example.app.service;

import com.example.app.dto.request.TodoRequest;
import com.example.app.dto.response.TodoResponse;
import com.example.app.entity.Todo;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.TodoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoService {
    private static final Logger log = LoggerFactory.getLogger(TodoService.class);
    
    private final TodoRepository todoRepository;
    
    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }
    
    public TodoResponse createTodo(User user, TodoRequest request) {
        validateTitle(request.getTitle());
        
        Todo todo = Todo.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .completed(false)
                .build();
        
        todo = todoRepository.save(todo);
        log.info("Todo created for user {}: {}", user.getUsername(), todo.getTitle());
        
        return toResponse(todo);
    }
    
    private void validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw BusinessException.of("标题不能为空");
        }
        if (title.length() > 200) {
            throw BusinessException.of("标题长度不能超过200个字符");
        }
    }
    
    public List<TodoResponse> getUserTodos(User user) {
        return todoRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }
    
    public List<TodoResponse> getUserTodosByStatus(User user, Boolean completed) {
        return todoRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(user.getId(), completed)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    
    public TodoResponse updateTodo(User user, Long todoId, TodoRequest request) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> ResourceNotFoundException.of("待办事项", todoId));
        
        if (!todo.getUser().getId().equals(user.getId())) {
            throw BusinessException.of("无权限操作此待办");
        }
        
        if (request.getTitle() != null) {
            validateTitle(request.getTitle());
            todo.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            todo.setDescription(request.getDescription());
        }
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        }
        todo = todoRepository.save(todo);
        
        return toResponse(todo);
    }
    
    public TodoResponse toggleTodoStatus(User user, Long todoId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> ResourceNotFoundException.of("待办事项", todoId));
        
        if (!todo.getUser().getId().equals(user.getId())) {
            throw BusinessException.of("无权限操作此待办");
        }
        
        todo.setCompleted(!todo.getCompleted());
        todo = todoRepository.save(todo);
        
        log.info("Todo status changed: {} - {}", todoId, todo.getCompleted());
        return toResponse(todo);
    }
    
    public void deleteTodo(User user, Long todoId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> ResourceNotFoundException.of("待办事项", todoId));
        
        if (!todo.getUser().getId().equals(user.getId())) {
            throw BusinessException.of("无权限删除此待办");
        }
        
        todoRepository.delete(todo);
        log.info("Todo deleted: {}", todoId);
    }
    
    private TodoResponse toResponse(Todo todo) {
        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .description(todo.getDescription())
                .dueDate(todo.getDueDate())
                .completed(todo.getCompleted())
                .createdAt(todo.getCreatedAt())
                .updatedAt(todo.getUpdatedAt())
                .build();
    }
}
