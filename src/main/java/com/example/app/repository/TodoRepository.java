package com.example.app.repository;

import com.example.app.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Todo> findByUserIdAndCompletedOrderByCreatedAtDesc(Long userId, Boolean completed);
    List<Todo> findByUserIdAndDueDateBeforeAndCompletedFalse(Long userId, LocalDate date);
    List<Todo> findByUserIdAndDueDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}