package com.example.app.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TodoResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private Boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TodoResponse() {
    }

    public TodoResponse(Long id, String title, String description, LocalDate dueDate, Boolean completed,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = completed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static TodoResponseBuilder builder() {
        return new TodoResponseBuilder();
    }

    public static class TodoResponseBuilder {
        private Long id;
        private String title;
        private String description;
        private LocalDate dueDate;
        private Boolean completed;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        public TodoResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public TodoResponseBuilder title(String title) {
            this.title = title;
            return this;
        }
        
        public TodoResponseBuilder description(String description) {
            this.description = description;
            return this;
        }
        
        public TodoResponseBuilder dueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }
        
        public TodoResponseBuilder completed(Boolean completed) {
            this.completed = completed;
            return this;
        }
        
        public TodoResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public TodoResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public TodoResponse build() {
            return new TodoResponse(id, title, description, dueDate, completed, createdAt, updatedAt);
        }
    }
}
