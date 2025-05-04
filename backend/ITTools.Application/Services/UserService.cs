using ITTools.Application.DTO;
using ITTools.Application.Exceptions;
using ITTools.Domain.Entities;
using ITTools.Domain.Enums;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Application.Services
{
    public class UserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UserService> _logger;

        public UserService(IUnitOfWork unitOfWork, ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsersAsync()
        {
            _logger?.LogInformation("Retrieving all users list...");

            try
            {
                var users = await _unitOfWork.Users.GetAllAsync();
                _logger?.LogInformation("Successfully retrieved all users list!");

                // Map to DTOs
                var userDTOs = users.Select(user => new UserDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                });
                return userDTOs;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while retrieving all users...");
                throw;
            }
        }

        public async Task CreatePremiumUpgradeRequest(int userId)
        {
            _logger?.LogInformation("Creating premium upgrade request for user with ID: {UserId}", userId);
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    _logger?.LogWarning("User with ID {UserId} not found.", userId);
                    throw new NotFoundException($"User with ID {userId} not found.");
                }

                if (user.Role == UserRole.Premium)
                {
                    _logger?.LogWarning("User with ID {UserId} is already a premium user.", userId);
                    throw new InvalidOperationException($"User with ID {userId} is already a premium user.");
                }

                if (user.Role == UserRole.Admin)
                {
                    _logger?.LogWarning("User with ID {UserId} is an admin and cannot request a premium upgrade.", userId);
                    throw new InvalidOperationException($"User with ID {userId} is an admin and cannot request a premium upgrade.");
                }

                // Check if a request already exists and is pending
                var existingRequests = await _unitOfWork.UpgradeRequests.GetByUserIdAsync(userId);
                bool isRequestPending = existingRequests.Any(r => r.Status == PremiumUpgradeRequestStatus.Pending);
                if (isRequestPending)
                {
                    _logger?.LogWarning("User with ID {UserId} already has a pending premium upgrade request.", userId);
                    throw new InvalidOperationException($"User with ID {userId} already has a pending premium upgrade request.");
                }

                await _unitOfWork.UpgradeRequests.AddAsync(new PremiumUpgradeRequest
                {
                    UserId = userId,
                    RequestTimestamp = DateTime.UtcNow,
                });

                await _unitOfWork.CommitAsync();

                _logger?.LogInformation("Successfully created premium upgrade request for user with ID: {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while creating premium upgrade request for user with ID: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<PremiumUpgradeRequest>> GetAllPremiumUpgradeRequestsAsync()
        {
            _logger?.LogInformation("Retrieving all premium upgrade requests...");
            try
            {
                var requests = await _unitOfWork.UpgradeRequests.GetAllAsync();
                _logger?.LogInformation("Successfully retrieved all premium upgrade requests!");
                return requests;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while retrieving all premium upgrade requests...");
                throw;
            }
        }

        public async Task DeletePremiumRequestAsync(int requestId)
        {
            _logger?.LogInformation("Deleting premium upgrade request with ID: {RequestId}", requestId);
            try
            {
                var request = await _unitOfWork.UpgradeRequests.GetByIdAsync(requestId);
                if (request == null)
                {
                    _logger?.LogWarning("Premium upgrade request with ID {RequestId} not found.", requestId);
                    throw new NotFoundException($"Premium upgrade request with ID {requestId} not found.");
                }

                await _unitOfWork.UpgradeRequests.DeleteAsync(requestId);
                await _unitOfWork.CommitAsync();
                _logger?.LogInformation("Successfully deleted premium upgrade request with ID: {RequestId}", requestId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while deleting premium upgrade request with ID: {RequestId}", requestId);
                throw;
            }
        }

        public async Task UpdateUpgradeRequest(int requestId, int userId, PremiumUpgradeRequestStatus status, string notes)
        {
            _logger?.LogInformation("Updating premium upgrade request with ID: {RequestId}", requestId);
            try
            {
                var request = await _unitOfWork.UpgradeRequests.GetByIdAsync(requestId);
                if (request == null)
                {
                    _logger?.LogWarning("Premium upgrade request with ID {RequestId} not found.", requestId);
                    throw new NotFoundException($"Premium upgrade request with ID {requestId} not found.");
                }
                if (status == PremiumUpgradeRequestStatus.Approved)
                {
                    _logger?.LogInformation("Request {RequestId} approved. Attempting to upgrade user ID {UserId} to Premium.", requestId, request.UserId);


                    var userToUpgrade = await _unitOfWork.Users.GetByIdAsync(request.UserId);

                    if (userToUpgrade == null)
                    {

                        _logger?.LogError("User with ID {UserId} associated with request {RequestId} not found. Cannot upgrade role.", request.UserId, requestId);

                    }

                    else if (userToUpgrade.Role == UserRole.User)
                    {

                        userToUpgrade.Role = UserRole.Premium;

                        _logger?.LogInformation("Successfully set user ID {UserId} role to Premium. Changes will be saved on commit.", request.UserId);
                    }
                    else
                    {
                        _logger?.LogWarning("User ID {UserId} already has role {CurrentRole} or is Admin. No role change performed.", userToUpgrade.Id, userToUpgrade.Role);
                    }
                }

                request.Status = status;
                request.AdminNotes = notes;
                request.ProcessedByUserId = userId;
                request.ProcessedTimestamp = DateTime.UtcNow;

                await _unitOfWork.UpgradeRequests.UpdateAsync(request);
                await _unitOfWork.CommitAsync();
                _logger?.LogInformation("Successfully updated premium upgrade request with ID: {RequestId}", requestId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while updating premium upgrade request with ID: {RequestId}", requestId);
                throw;
            }
        }
    }
}
