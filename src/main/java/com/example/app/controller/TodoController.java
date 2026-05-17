package com.example.app.controller;

import com.example.app.dto.request.TodoRequest;
import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.TodoResponse;
import com.example.app.entity.User;
import com.example.app.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {
    private final TodoService todoService;
    
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<TodoResponse>> createTodo(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TodoRequest request) {
        TodoResponse response = todoService.createTodo(user, request);
        return ResponseEntity.ok(ApiResponse.success("创建成功", response));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TodoResponse>>> getUserTodos(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Boolean completed) {
        List<TodoResponse> todos;
        if (completed != null) {
            todos = todoService.getUserTodosByStatus(user, completed);
        } else {
            todos = todoService.getUserTodos(user);
        }
        return ResponseEntity.ok(ApiResponse.success(todos));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TodoResponse>> updateTodo(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest request) {
        TodoResponse response = todoService.updateTodo(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("更新成功", response));
    }
    
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TodoResponse>> toggleTodo(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        TodoResponse response = todoService.toggleTodoStatus(user, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTodo(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        todoService.deleteTodo(user, id);
        return ResponseEntity.ok(ApiResponse.success("删除成功", null));
    }
}
