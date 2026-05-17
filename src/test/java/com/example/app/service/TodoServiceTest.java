package com.example.app.service;

import com.example.app.dto.request.TodoRequest;
import com.example.app.dto.response.TodoResponse;
import com.example.app.entity.Todo;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TodoService 单元测试")
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @InjectMocks
    private TodoService todoService;

    private User testUser;
    private Todo testTodo;
    private TodoRequest validTodoRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("encodedPassword")
                .enabled(true)
                .build();

        testTodo = Todo.builder()
                .id(1L)
                .user(testUser)
                .title("Test Todo")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(1))
                .completed(false)
                .build();

        validTodoRequest = new TodoRequest();
        validTodoRequest.setTitle("New Todo");
        validTodoRequest.setDescription("New Description");
        validTodoRequest.setDueDate(LocalDate.now().plusDays(2));
    }

    @Test
    @DisplayName("创建待办 - 成功")
    void createTodo_ShouldReturnTodoResponse_WhenValidRequest() {
        when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

        TodoResponse response = todoService.createTodo(testUser, validTodoRequest);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("Test Todo", response.getTitle());
        verify(todoRepository, times(1)).save(any(Todo.class));
    }

    @Test
    @DisplayName("创建待办 - 标题为空")
    void createTodo_ShouldThrowException_WhenTitleEmpty() {
        TodoRequest request = new TodoRequest();
        request.setTitle("");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            todoService.createTodo(testUser, request);
        });

        assertEquals("标题不能为空", exception.getMessage());
        verify(todoRepository, never()).save(any(Todo.class));
    }

    @Test
    @DisplayName("创建待办 - 标题过长")
    void createTodo_ShouldThrowException_WhenTitleTooLong() {
        TodoRequest request = new TodoRequest();
        request.setTitle("A".repeat(201));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            todoService.createTodo(testUser, request);
        });

        assertEquals("标题长度不能超过200个字符", exception.getMessage());
    }

    @Test
    @DisplayName("获取用户待办 - 成功")
    void getUserTodos_ShouldReturnTodoList_WhenUserHasTodos() {
        Todo todo2 = Todo.builder()
                .id(2L)
                .user(testUser)
                .title("Test Todo 2")
                .completed(true)
                .build();

        when(todoRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(testTodo, todo2));

        List<TodoResponse> todos = todoService.getUserTodos(testUser);

        assertNotNull(todos);
        assertEquals(2, todos.size());
        assertEquals("Test Todo", todos.get(0).getTitle());
        assertEquals("Test Todo 2", todos.get(1).getTitle());
        verify(todoRepository, times(1)).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    @DisplayName("获取用户待办 - 无待办")
    void getUserTodos_ShouldReturnEmptyList_WhenUserHasNoTodos() {
        when(todoRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList());

        List<TodoResponse> todos = todoService.getUserTodos(testUser);

        assertNotNull(todos);
        assertTrue(todos.isEmpty());
    }

    @Test
    @DisplayName("获取用户待办 - 按状态筛选")
    void getUserTodosByStatus_ShouldReturnFilteredList() {
        Todo completedTodo = Todo.builder()
                .id(2L)
                .user(testUser)
                .title("Completed Todo")
                .completed(true)
                .build();

        when(todoRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(1L, true))
                .thenReturn(Arrays.asList(completedTodo));

        List<TodoResponse> todos = todoService.getUserTodosByStatus(testUser, true);

        assertNotNull(todos);
        assertEquals(1, todos.size());
        assertTrue(todos.get(0).getCompleted());
    }

    @Test
    @DisplayName("更新待办 - 成功")
    void updateTodo_ShouldReturnUpdatedTodo_WhenValidRequest() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(testTodo));
        when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

        TodoRequest updateRequest = new TodoRequest();
        updateRequest.setTitle("Updated Title");

        TodoResponse response = todoService.updateTodo(testUser, 1L, updateRequest);

        assertNotNull(response);
        assertEquals("Test Todo", response.getTitle());
        verify(todoRepository, times(1)).findById(1L);
        verify(todoRepository, times(1)).save(any(Todo.class));
    }

    @Test
    @DisplayName("更新待办 - 待办不存在")
    void updateTodo_ShouldThrowException_WhenTodoNotFound() {
        when(todoRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            todoService.updateTodo(testUser, 999L, validTodoRequest);
        });

        assertEquals("待办事项", exception.getResourceType());
        assertEquals(999L, exception.getResourceId());
    }

    @Test
    @DisplayName("更新待办 - 无权限")
    void updateTodo_ShouldThrowException_WhenNotOwner() {
        User anotherUser = User.builder()
                .id(2L)
                .username("another")
                .enabled(true)
                .build();

        when(todoRepository.findById(1L)).thenReturn(Optional.of(testTodo));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            todoService.updateTodo(anotherUser, 1L, validTodoRequest);
        });

        assertEquals("无权限操作此待办", exception.getMessage());
    }

    @Test
    @DisplayName("切换待办状态 - 成功")
    void toggleTodoStatus_ShouldToggleCompleted() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(testTodo));
        when(todoRepository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TodoResponse response = todoService.toggleTodoStatus(testUser, 1L);

        assertNotNull(response);
        assertTrue(response.getCompleted());
        verify(todoRepository, times(1)).save(any(Todo.class));
    }

    @Test
    @DisplayName("删除待办 - 成功")
    void deleteTodo_ShouldRemoveTodo() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(testTodo));
        doNothing().when(todoRepository).delete(any(Todo.class));

        assertDoesNotThrow(() -> todoService.deleteTodo(testUser, 1L));
        verify(todoRepository, times(1)).findById(1L);
        verify(todoRepository, times(1)).delete(any(Todo.class));
    }

    @Test
    @DisplayName("删除待办 - 无权限")
    void deleteTodo_ShouldThrowException_WhenNotOwner() {
        User anotherUser = User.builder()
                .id(2L)
                .username("another")
                .enabled(true)
                .build();

        when(todoRepository.findById(1L)).thenReturn(Optional.of(testTodo));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            todoService.deleteTodo(anotherUser, 1L);
        });

        assertEquals("无权限删除此待办", exception.getMessage());
        verify(todoRepository, never()).delete(any(Todo.class));
    }
}