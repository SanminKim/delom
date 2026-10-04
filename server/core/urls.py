from django.urls import path
from rest_framework.routers import SimpleRouter

from . import views as v

router = SimpleRouter()
router.register("projects", v.ProjectViewSet, basename="project")
router.register("participations", v.ParticipationViewSet, basename="participation")
router.register("vacancies", v.VacancyViewSet, basename="vacancy")

urlpatterns = [
    path("auth/register/", v.RegisterView.as_view()),
    path("auth/login/", v.LoginView.as_view()),
    path("auth/logout/", v.LogoutView.as_view()),
    path("auth/me/", v.MeView.as_view()),
    path("profile/", v.ProfileView.as_view()),
    path("skills/", v.SkillList.as_view()),
    path("participations/<int:pk>/file/", v.SolutionFileView.as_view()),
    path("participations/<int:pk>/favorite/", v.FavoriteView.as_view()),
    path("participations/<int:pk>/review/", v.ReviewView.as_view()),
    path("mentor/queue/", v.MentorQueue.as_view()),
    path("passport/", v.PassportView.as_view()),
    path("students/<int:pk>/", v.PublicPassportView.as_view()),
    path("applications/", v.MyApplications.as_view()),
    path("applications/<int:pk>/invite/", v.AnswerApplication.as_view()),
    path("applications/<int:pk>/reject/", v.RejectApplication.as_view()),
    path("candidates/", v.CandidateSearch.as_view()),
    path("hiring/", v.HiringList.as_view()),
    path("hiring/mine/", v.MyOffers.as_view()),
    path("hiring/<int:pk>/move/", v.HiringMove.as_view()),
    path("companies/<int:pk>/", v.CompanyView.as_view()),
    path("companies/<int:pk>/review/", v.CompanyReviewView.as_view()),
    path("messages/", v.MessagesView.as_view()),
    path("notifications/", v.NotificationsView.as_view()),
    path("university/students/", v.UniversityStudents.as_view()),
    path("university/summary/", v.UniversitySummary.as_view()),
] + router.urls
