# Quick Start Guide

## Starting the Servers

Simply double-click `start-servers.bat` or run it from the command line:

```cmd
start-servers.bat
```

This will:
1. Check if Python and Node.js are installed
2. Install Python dependencies globally (no venv needed)
3. Install Node.js dependencies (if needed)
4. Start the Django backend server on port 8000 (in background)
5. Start the Next.js frontend server on port 3000 (in background)

Both servers run in the background. Logs are written to:
- `backend.log` - Backend server logs
- `frontend.log` - Frontend server logs

## Stopping the Servers

**Option 1 (Recommended):** Press `Ctrl+C` in the main window that started the servers, or simply close the window.

**Option 2:** Run the stop script:
```cmd
stop-servers.bat
```

When you close the main window, both servers will automatically stop.

## Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs/
- **Admin Panel:** http://localhost:8000/admin/

## Notes

- Python dependencies are installed globally (no virtual environment needed)
- The servers run in the background - no separate windows are opened
- Server logs are written to `backend.log` and `frontend.log` files
- Closing the main window will automatically stop both servers
- Use `Ctrl+C` or `stop-servers.bat` to stop servers manually

