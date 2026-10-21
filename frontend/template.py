
from pathlib import Path

# Run this script from the frontend directory.
BASE = Path(".")

folders = [
    "public/images",

    "src/assets",

    "src/components/ui",
    "src/components/layout",
    "src/components/documents",
    "src/components/chat",
    "src/components/evidence",

    "src/pages",

    "src/context",
    "src/hooks",
    "src/services",
    "src/types",
    "src/utils",
]

files = [
    # Assets
    "src/assets/logo.svg",

    # UI components
    "src/components/ui/Button.tsx",
    "src/components/ui/Input.tsx",
    "src/components/ui/Modal.tsx",
    "src/components/ui/Badge.tsx",
    "src/components/ui/Spinner.tsx",
    "src/components/ui/EmptyState.tsx",
    "src/components/ui/ThemeToggle.tsx",

    # Layout components
    "src/components/layout/Navbar.tsx",
    "src/components/layout/Sidebar.tsx",
    "src/components/layout/DashboardLayout.tsx",
    "src/components/layout/ProtectedRoute.tsx",

    # Document components
    "src/components/documents/DocumentCard.tsx",
    "src/components/documents/DocumentList.tsx",
    "src/components/documents/DocumentUpload.tsx",
    "src/components/documents/DocumentStatus.tsx",

    # Chat components
    "src/components/chat/ChatWindow.tsx",
    "src/components/chat/ChatMessage.tsx",
    "src/components/chat/ChatInput.tsx",
    "src/components/chat/ConversationList.tsx",

    # Evidence components
    "src/components/evidence/CitationCard.tsx",
    "src/components/evidence/EvidencePanel.tsx",
    "src/components/evidence/ConflictCard.tsx",

    # Pages
    "src/pages/LandingPage.tsx",
    "src/pages/LoginPage.tsx",
    "src/pages/SignupPage.tsx",
    "src/pages/DashboardPage.tsx",
    "src/pages/DocumentsPage.tsx",
    "src/pages/AnalysisPage.tsx",
    "src/pages/SettingsPage.tsx",
    "src/pages/NotFoundPage.tsx",

    # Context
    "src/context/AuthContext.tsx",
    "src/context/ThemeContext.tsx",

    # Custom hooks
    "src/hooks/useAuth.ts",
    "src/hooks/useTheme.ts",
    "src/hooks/useDocuments.ts",
    "src/hooks/useAnalysis.ts",

    # API services
    "src/services/api.ts",
    "src/services/authService.ts",
    "src/services/documentService.ts",
    "src/services/analysisService.ts",
    "src/services/conversationService.ts",

    # TypeScript types
    "src/types/auth.ts",
    "src/types/document.ts",
    "src/types/analysis.ts",
    "src/types/citation.ts",
    "src/types/conversation.ts",

    # Utility functions
    "src/utils/formatDate.ts",
    "src/utils/formatFileSize.ts",
    "src/utils/validators.ts",

    # Environment example
    ".env.example",
]

created_folders = 0
created_files = 0
skipped_files = 0

print("\nCreating Clarivue frontend structure...\n")

# Create folders
for folder in folders:
    path = BASE / folder

    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)
        print(f"[FOLDER] {folder}")
        created_folders += 1
    else:
        print(f"[EXISTS] {folder}")

# Create empty files without overwriting existing files
for file in files:
    path = BASE / file

    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        path.touch()
        print(f"[FILE]   {file}")
        created_files += 1
    else:
        print(f"[SKIP]   {file} (already exists)")
        skipped_files += 1

print("\n" + "=" * 45)
print("Clarivue frontend structure is ready!")
print(f"Folders created: {created_folders}")
print(f"Files created:   {created_files}")
print(f"Files skipped:   {skipped_files}")
print("=" * 45)
print("\nExisting files were preserved.")
print("Next: implement the application files step by step.")
