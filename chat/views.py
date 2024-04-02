from django.shortcuts import render, redirect
import json
from account.models import User
from django.contrib.auth.models import  Group
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from account.forms import AddUserForm, EditUserForm
from .models import Room




@require_POST
def create_room(request, uuid):
    name = request.POST.get('name', '')
    url = request.POST.get('url', '')

    Room.objects.create(uuid=uuid, client=name, url=url)

    return JsonResponse({'message': 'room created successfully'})


def admin(request):
    rooms = Room.objects.all()
    users = User.objects.filter(is_staff=True)

    return render(request, 'chat/admin.html',{
        'rooms': rooms,
        'users': users

    })


@login_required
def room(request, uuid):
    room = Room.objects.get(uuid=uuid)
    if room.status == Room.WAITING:
        room.status = Room.ACTIVE
        room.agent = request.user
        room.save()

    return render(request, 'chat/room.html',{
        'room': room
    })



@login_required
def delete_room(request, uuid):
    if request.user.has_perm('room.delete_room'):
        room = Room.objects.get(uuid=uuid)
        room.delete()
        messages.success(request, 'The room was deleted!')
        return redirect('/chat-admin/')

    else:
        messages.error(request, 'You dont\'t have permission to edit')

        return redirect('/chat-admin/')
        

@login_required
def user_detail(request, uuid):
    user = User.objects.get(pk=uuid)
    rooms = user.rooms.all()
    return render(request, 'chat/user_detail.html',{
                  "user":user,
                  'rooms':rooms
                  })


@login_required
def edit_detail(request, uuid):
    if request.user.has_perm('user.edit_user'):
        user = User.objects.get(id=uuid)

        if request.method == 'POST':
            form = EditUserForm(request.POST, instance=user)

            if form.is_valid():
                form.save()
                
                messages.success(request, 'The Change was saved!')

                return redirect('/chat-admin/')
        else: 
            form = EditUserForm(instance=user)
        return render(request,'chat/edit_user.html', {
                          'form':form,
                          'user':user
                      })
    else:
        messages.error(request, 'You dont\'t have permission to edit')

        return redirect('/chat-admin/')

@login_required
def add_user(request):
    if request.user.has_perm('user.add_user'):
        if request.method == 'POST':
            form = AddUserForm(request.POST)

            if form.is_valid():
                user = form.save(commit=False)
                user.is_staff = True
                user.set_password(request.POST.get('password'))
                user.save()

                if user.role == user.MANAGER:
                    group = Group.objects.get(name='Managers')
                    group.user_set.add(user)

                messages.success(request, 'User Was added!')

                return redirect('/chat-admin/')
        else:
            form = AddUserForm(request.POST)

        return render(request, 'chat/add_user.html',{"form":form})
    else:
        messages.error(request, "You dn\'t have acces to add users!")
        
        return redirect('/chat-admin/')
        