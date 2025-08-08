using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace InsurancePortal.API.Hubs
{
    [Authorize]
    public class ClaimHub : Hub
    {
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task SendClaimUpdate(string message)
        {
            await Clients.All.SendAsync("ReceiveClaimUpdate", message);
        }
    }
}
